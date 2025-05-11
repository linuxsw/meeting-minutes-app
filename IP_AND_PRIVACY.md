# AI Enhanced Meeting Minutes Generator: IP and Data Privacy Considerations

## 1. Introduction

This document outlines how the "AI Enhanced Meeting Minutes Generator" application handles your data, particularly your intellectual property (IP) and personal information, when processing meeting recordings and transcripts, especially when utilizing integrated AI services.

Our goal is to provide transparency so you can make informed decisions about using this tool with your sensitive meeting content.

## 2. Core Application Data Flow: Local Processing First

The primary functions of transcription, language identification, and speaker diarization are designed with privacy as a priority, utilizing local processing capabilities.

*   **Upload**: You upload an audio or video file directly to the application.
*   **Temporary Server Storage**: The uploaded file is temporarily stored on the server hosting the application to enable processing.
*   **Local Audio Processing (SpeechBrain)**:
    *   The core audio analysis (transcription, language detection, speaker identification) is performed by the `audio_processor.py` script. This script uses the **SpeechBrain** library along with **PyTorch/Torchaudio**.
    *   **Crucially, all SpeechBrain processing happens *locally* on the server where the application is deployed.** Your raw audio/video data is **NOT** sent to any external third-party AI service for these fundamental transcription and diarization steps.
    *   SpeechBrain models are downloaded by the application and run locally.
*   **Temporary File Deletion**: The original uploaded audio/video file stored temporarily on the server is deleted after the local processing is complete or if an error occurs during processing.
*   **Result**: The output of this local processing is a structured transcript (text, speaker labels, timestamps), which is then used within the application for review and document generation.

**IP Implication for Core Processing**: Since the core audio processing is local, your original audio/video content and the initial raw transcript remain within the infrastructure where the application is hosted. You retain full control and ownership over this data during this stage.

## 3. Optional AI Enhancement Features (Summarization, Advanced Analysis)

Beyond core transcription, the application offers (or plans to offer) enhanced AI features like summarization, key point extraction, and action item detection. These features may utilize external cloud-based AI providers or a local AI solution (Ollama).

**It is important to understand that if you choose to use these optional enhancements with a cloud-based AI provider, the *text-based transcript* (derived from the local processing) will be sent to that provider.** The original audio/video is NOT sent for these enhancements.

Here’s how data is handled by the currently supported/planned AI providers for these *enhancement* tasks:

### 3.1. Ollama (Local AI)

*   **Data Handling**: If you configure and use Ollama (which runs locally on your machine or within your own Docker environment), the text transcript data sent for enhancement (e.g., summarization) is processed by the Ollama instance running in your local environment.
*   **IP Implication**: Your data **does not leave your local infrastructure**. This offers the highest level of privacy and IP control for AI enhancements.

### 3.2. OpenAI API (e.g., for GPT models)

*   **Data Sent**: Text-based transcript segments.
*   **Data Usage Policy (as of May 2024 - users should always verify current terms)**:
    *   **Ownership**: You own your input (the transcript text you send) and the output (e.g., the summary you receive).
    *   **Training**: OpenAI **does not** use data submitted via their API to train their publicly available models or improve their services by default. You would need to explicitly opt-in for them to use your data for training.
    *   **Data Retention**: API data is retained for a maximum of 30 days for abuse and misuse monitoring. After this period, it is typically deleted unless there's a legal obligation to retain it.
    *   **Confidentiality**: OpenAI states commitments to data security and confidentiality.
*   **IP Implication**: While OpenAI's terms are favorable regarding data ownership and not using API data for training by default, sending transcript data to a third-party service inherently involves a degree of trust in that provider's security and privacy practices.
*   **Further Information**: Refer to [OpenAI's Data Usage Policies](https://platform.openai.com/docs/data-usage-policies) and [Enterprise Privacy](https://openai.com/enterprise-privacy/).

### 3.3. Together AI API

*   **Data Sent**: Text-based transcript segments.
*   **Data Usage Policy (as of May 2024 - users should always verify current terms)**:
    *   **Ownership**: You retain ownership of your data.
    *   **Training**: Together AI states they **do not** use data collected from you to train their models without your explicit opt-in and consent.
    *   **Security**: They employ industry-standard security measures.
*   **IP Implication**: Similar to OpenAI, the terms are generally protective of user IP and data, but it involves sending data to a third-party service.
*   **Further Information**: Refer to [Together AI's Privacy Policy](https://www.together.ai/privacy).

### 3.4. "No AI" Option

The application allows you to bypass these AI enhancement features entirely, ensuring your transcript data is not sent to any external AI provider beyond the local SpeechBrain processing.

## 4. Intellectual Property (IP) Summary

*   **Locally Processed Content (Audio, Initial Transcript)**: Your IP rights are fully maintained as the data is processed on the server where the application is hosted and does not leave your control for core transcription/diarization.
*   **Content Sent to Cloud AI APIs (Text Transcripts for Enhancements)**: According to the terms of providers like OpenAI and Together AI, you retain ownership of your input and output. They commit not to use your API data for training their general models by default.
*   **Content Processed by Local AI (Ollama for Enhancements)**: Your IP rights are fully maintained as the data remains within your local environment.

## 5. Data Security and Best Practices

*   **Data in Transit**: The application should use HTTPS (secure, encrypted connections) for all communication between your browser and the application server, and between the application server and any external AI APIs.
*   **Data at Rest (Application Server)**:
    *   Uploaded audio files are stored temporarily and then deleted.
    *   The application currently does not implement long-term server-side storage of full transcripts or generated meeting minutes. If this were to be added, robust security measures for data at rest (encryption, access controls) would be the responsibility of those deploying and managing the application instance.
*   **User Responsibility**: Users should always review the current terms of service and privacy policies of any third-party AI provider they choose to use through this application.
*   **Sensitive Information**: For highly confidential or IP-sensitive meetings, it is strongly recommended to:
    1.  Rely on the local SpeechBrain processing for transcription and diarization.
    2.  Use the "No AI" option for enhancements, or use a locally hosted AI solution like Ollama if enhancements are desired.

## 6. User Control and Transparency

*   **Choice of AI Provider**: The application aims to provide clear choices for AI enhancement features, including the option to use local AI (Ollama) or no AI at all.
*   **Clear Indication**: The user interface should clearly indicate when data (even if only text transcripts) is about to be sent to an external, third-party cloud AI service, allowing users to make an informed choice before proceeding.

## 7. Disclaimer

This document provides information based on the application's design and understanding of AI provider policies as of May 2024. AI provider terms and policies can change. Users are responsible for regularly reviewing the terms of any AI services they utilize. The developers of the "AI Enhanced Meeting Minutes Generator" are not liable for data handling practices of third-party AI providers.

--- 

This document aims to clarify how your data and IP are handled. We are committed to providing a tool that respects your privacy and gives you control over your information.
