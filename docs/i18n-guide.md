# Internationalization (i18n) Guide

This document provides information on the internationalization (i18n) features of the Meeting Minutes Generator application.

## Supported Languages

The application currently supports the following languages:

- English (en) - Default
- Korean (ko) - 한국어
- Japanese (ja) - 日本語

## Language Switching

Users can change the application language at any time using the language switcher located in the top-right corner of the application. The language selection is applied immediately to all UI elements.

## Audio Language Selection

When uploading audio or video files, users can specify the language of the content to improve transcription accuracy:

1. **Auto-detect** (default): The system will automatically detect the spoken language.
2. **Specific language**: Users can select a specific language from the dropdown menu.

Supported audio languages include:
- English
- Korean (한국어)
- Japanese (日本語)
- Chinese (中文)
- Spanish (Español)
- French (Français)
- German (Deutsch)

## For Developers

### Adding New UI Languages

To add support for a new UI language:

1. Create a new directory in `/public/locales/` with the language code (e.g., `/public/locales/fr/` for French)
2. Copy the JSON files from an existing language directory and translate the values
3. Add the new language code to the `locales` array in `next-i18next.config.js`
4. Add the language to the `languages` array in the `LanguageSwitcher` component

### Adding New Audio Processing Languages

To add support for a new audio processing language:

1. Add the language to the `audioLanguages` array in the `FileUploader` component
2. Update the `language_model_map` in the Python audio processor script to include the appropriate ASR model for the new language

### Translation Files Structure

Translation files are organized by namespaces:
- `common.json`: Shared translations used across the application
- Other namespace files for specific pages or features

### i18n Implementation Details

The application uses the following libraries for internationalization:
- `next-i18next`: Core i18n framework for Next.js
- `react-i18next`: React bindings for i18next
- `i18next`: The underlying i18n framework

The implementation follows these principles:
- Server-side rendering of translations
- Client-side language switching without page reloads
- Namespace-based organization of translations
- Font support for CJK (Chinese, Japanese, Korean) characters
