import { countryCallingCodes } from '@/data/countryCallingCodes';

export function getCompanyDefaultCountry(company) {
    return String(company?.system_country || '').trim();
}

export function getCompanyDefaultPhoneCountry(company) {
    const systemCountry = getCompanyDefaultCountry(company);
    const match = countryCallingCodes.find(
        (r) => String(r?.name || '').toLowerCase() === systemCountry.toLowerCase(),
    );

    return {
        countryCode: match?.callingCode || '',
        countryIso2: match?.iso2 || '',
    };
}
