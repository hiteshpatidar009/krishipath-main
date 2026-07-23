/**
 * Centralized dictionary of default crop translations and aliases.
 * This can be expanded to include all 70+ crops.
 * Adding new crops here will automatically apply to the fuzzy parser and any other components using this mapping.
 */
export const DEFAULT_CROP_TRANSLATIONS = {
    'Onion': ['प्याज', 'pyaj', 'pyaaz', 'kanda'],
    'Cotton': ['कपास', 'kapas', 'rui'],
    'Wheat': ['गेहूं', 'gehun', 'gehu'],
    'Soyabean': ['सोयाबीन', 'soyabean', 'soya'],
    'Chana': ['चना', 'chana', 'gram'],
    'Mustard': ['सरसों', 'sarson', 'rai'],
    'Garlic': ['लहसुन', 'lahsun', 'lehsun'],
    'Potato': ['आलू', 'aalu', 'potato'],
    // Add new crops below:
};
