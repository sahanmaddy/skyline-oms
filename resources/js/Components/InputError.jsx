export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            data-field-error="true"
            className={'text-sm text-red-600 ' + className}
        >
            {message}
        </p>
    ) : null;
}
