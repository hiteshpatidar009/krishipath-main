# Localization Rule
- **Backend Hydration**: The backend automatically translates dynamic data (like Mandi names, Crop names, Categories) based on the `Accept-Language` header sent by the frontend API client.
- **Frontend Display**: In the React Native app, do NOT attempt to extract translations manually (e.g., using `crop.names[language]`). The API response will dynamically hydrate the default fields (`crop.name`, `mandi.name`) with the translated text. You should just display `crop.name` directly.
- **Consistency**: The same localized behavior applies across all lists fetched from the DB (crops, mandis, markets). The frontend only needs to ensure that the `Accept-Language` header is passed correctly via the `ApiService.js`.
