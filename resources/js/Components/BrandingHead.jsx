import { Head, usePage } from '@inertiajs/react';

/**
 * Dynamic favicon from Company Settings (SPA navigations). Pair with document title via app.jsx.
 */
export default function BrandingHead() {
    const company = usePage().props.company;
    const href = company?.site_icon_url;

    if (!href) {
        return null;
    }

    return (
        <Head>
            <link rel="icon" type="image/png" href={href} key="company-site-icon" />
        </Head>
    );
}
