<?php

namespace App\Http\Controllers;

use App\Http\Requests\CustomerDocumentReplaceRequest;
use App\Http\Requests\CustomerDocumentStoreRequest;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Services\CustomerDocuments\CustomerDocumentStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentController extends Controller
{
    public function store(
        CustomerDocumentStoreRequest $request,
        Customer $customer,
        CustomerDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('update', $customer);

        $documentType = $request->string('document_type')->toString();
        $title = $request->string('title')->toString();

        $meta = $storage->store($customer, $request->file('file'), $title);

        CustomerDocument::create([
            'customer_id' => $customer->id,
            'document_type' => $documentType,
            'title' => $title,
            'notes' => $request->input('notes'),
            ...$meta,
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    public function replace(
        CustomerDocumentReplaceRequest $request,
        Customer $customer,
        CustomerDocument $document,
        CustomerDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('update', $customer);
        $this->authorize('update', $document);

        $documentType = $request->input('document_type', $document->document_type);
        $title = $request->input('title', $document->title);

        $meta = $storage->replace(
            $document->file_path,
            $customer,
            $request->file('file'),
            $title,
            $document->id
        );

        $document->update([
            ...$meta,
            'document_type' => $documentType,
            'title' => $title,
            'notes' => $request->input('notes', $document->notes),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document replaced.');
    }

    public function destroy(
        Customer $customer,
        CustomerDocument $document,
        CustomerDocumentStorageService $storage
    ): RedirectResponse {
        $this->authorize('update', $customer);
        $this->authorize('delete', $document);

        $storage->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    public function download(Customer $customer, CustomerDocument $document): \Symfony\Component\HttpFoundation\Response
    {
        $this->authorize('view', $customer);
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function view(Customer $customer, CustomerDocument $document): \Symfony\Component\HttpFoundation\Response
    {
        $this->authorize('view', $customer);
        $this->authorize('view', $document);

        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->response($document->file_path, $document->file_name, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
        ]);
    }
}
