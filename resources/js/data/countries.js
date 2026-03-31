import { countryCallingCodes } from '@/data/countryCallingCodes';

export const countries = countryCallingCodes
    .map((country) => ({
        name: country.name,
        iso2: country.iso2,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

