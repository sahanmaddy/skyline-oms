import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useMemo, useRef, useState } from 'react';

export default function DocumentDropzone({
    documentTypeOptions,
    customerCode,
    onUpload,
    processing,
    errors,
}) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [documentType, setDocumentType] = useState(documentTypeOptions?.[0] ?? 'Other');
    const [title, setTitle] = useState('');
    const [isTitleCustom, setIsTitleCustom] = useState(false);
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);

    const defaultTitle = `${customerCode ?? ''} - ${documentType}`.trim();

    const fileLabel = useMemo(() => {
        if (!file) return 'No file selected';
        return `${file.name} (${Math.round(file.size / 1024)} KB)`;
    }, [file]);

    const chooseFile = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
        }
        inputRef.current?.click();
    };

    const handleFiles = (files) => {
        const selected = files?.[0];
        if (!selected) return;
        setFile(selected);
        if (!isTitleCustom) {
            setTitle(defaultTitle);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold text-gray-900">Upload document</div>
                    <div className="text-xs text-gray-500">Drag & drop a file, or click to select.</div>
                </div>
                <PrimaryButton
                    type="button"
                    disabled={processing}
                    onClick={() => {
                        if (!file) return;
                        onUpload({ document_type: documentType, title, notes, file });
                        setFile(null);
                        setTitle('');
                        setIsTitleCustom(false);
                        setNotes('');
                        if (inputRef.current) {
                            inputRef.current.value = '';
                        }
                    }}
                >
                    Upload
                </PrimaryButton>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                    <InputLabel value="Document type" />
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={documentType}
                        onChange={(e) => {
                            const nextType = e.target.value;
                            setDocumentType(nextType);
                            if (!isTitleCustom && file) {
                                setTitle(`${customerCode ?? ''} - ${nextType}`.trim());
                            }
                        }}
                    >
                        {documentTypeOptions?.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors?.document_type} />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel value="Title" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setIsTitleCustom(true);
                        }}
                        placeholder={`${customerCode ?? 'C-X'} - ${documentType}`}
                    />
                    <InputError className="mt-2" message={errors?.title} />
                </div>
            </div>

            <div className="mt-4">
                <InputLabel value="Notes" />
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <InputError className="mt-2" message={errors?.notes} />
            </div>

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />

            <button
                type="button"
                onClick={chooseFile}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={
                    'mt-4 w-full rounded-lg border-2 border-dashed p-4 text-left transition ' +
                    (isDragging
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')
                }
            >
                <div className="text-sm font-medium text-gray-700">{fileLabel}</div>
                <div className="mt-1 text-xs text-gray-500">Max 20 MB. Supported: any file type.</div>
                <InputError className="mt-2" message={errors?.file} />
            </button>
        </div>
    );
}

