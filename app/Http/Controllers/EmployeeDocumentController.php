<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeDocumentReplaceRequest;
use App\Http\Requests\EmployeeDocumentStoreRequest;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Services\EmployeeDocuments\EmployeeDocumentStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentController extends Controller
{
    public function store(
        EmployeeDocumentStoreRequest $request,
        Employee $employee,
        EmployeeDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('view', $employee);

        $documentType = $request->string('document_type')->toString();
        $meta = $storage->store($employee, $request->file('file'), $documentType);

        $employeeCode = trim((string) $employee->employee_code);
        $requestedTitle = $request->string('title')->toString();
        $expectedBaseTitle = trim("{$employeeCode} - {$documentType}");

        $finalTitle = $requestedTitle;

        // If the user kept the auto-filled default title and this upload
        // required a duplicate filename, reflect the (1), (2), ... in the title too.
        if (trim($requestedTitle) === $expectedBaseTitle) {
            $fileName = (string) ($meta['file_name'] ?? '');
            if (preg_match('/\((\d+)\)\.[^.]+$/', $fileName, $m)) {
                $suffixIndex = (int) $m[1];
                $finalTitle = trim("{$employeeCode} - {$documentType} ({$suffixIndex})");
            }
        }

        EmployeeDocument::create([
            'employee_id' => $employee->id,
            'document_type' => $documentType,
            'title' => $finalTitle,
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

        $documentType = $request->input('document_type', $document->document_type);
        $meta = $storage->replace(
            $document->file_path,
            $employee,
            $request->file('file'),
            $documentType,
            $document->id
        );

        $document->update([
            ...$meta,
            'document_type' => $documentType,
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

    public function download(Employee $employee, EmployeeDocument $document): \Symfony\Component\HttpFoundation\Response
    {
        $this->authorize('view', $employee);
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function view(Employee $employee, EmployeeDocument $document): \Symfony\Component\HttpFoundation\Response
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
