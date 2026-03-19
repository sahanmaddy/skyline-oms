<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeDocumentReplaceRequest;
use App\Http\Requests\EmployeeDocumentStoreRequest;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Services\EmployeeDocuments\EmployeeDocumentStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentController extends Controller
{
    public function store(
        EmployeeDocumentStoreRequest $request,
        Employee $employee,
        EmployeeDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('view', $employee);

        $meta = $storage->store($employee, $request->file('file'));

        EmployeeDocument::create([
            'employee_id' => $employee->id,
            'document_type' => $request->string('document_type')->toString(),
            'title' => $request->string('title')->toString(),
            'notes' => $request->input('notes'),
            ...$meta,
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    public function replace(
        EmployeeDocumentReplaceRequest $request,
        Employee $employee,
        EmployeeDocument $document,
        EmployeeDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('view', $employee);
        $this->authorize('update', $document);

        $meta = $storage->replace($document->file_path, $employee, $request->file('file'));

        $document->update([
            ...$meta,
            'document_type' => $request->input('document_type', $document->document_type),
            'title' => $request->input('title', $document->title),
            'notes' => $request->input('notes', $document->notes),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document replaced.');
    }

    public function destroy(Employee $employee, EmployeeDocument $document, EmployeeDocumentStorageService $storage): RedirectResponse
    {
        $this->authorize('view', $employee);
        $this->authorize('delete', $document);

        $storage->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    public function download(Employee $employee, EmployeeDocument $document): Response
    {
        $this->authorize('view', $employee);
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function view(Employee $employee, EmployeeDocument $document): Response
    {
        $this->authorize('view', $employee);
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->response($document->file_path, $document->file_name, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
        ]);
    }
}
