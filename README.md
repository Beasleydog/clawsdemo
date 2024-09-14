# A heavily simplified Vega clone.

## Demo Video
Note that its far from perfect, mainly a proof of concept :)

https://github.com/user-attachments/assets/b30c0fa8-1917-4497-a820-b12046ccf343



## Abilities:

- Only responds after hearing wakephrase ("Hey Computer...")
- Answer questions
- Take picture
- Add/Remove Todos

## STT and Reasoning

The "distil-whisper-large-v3-en" model powers the STT for the application. The incoming audio stream is sliced using the [Silero-vad](https://github.com/snakers4/silero-vad) model and [web-vad](https://github.com/jptaylor/web-vad) before being sent to Groq for STT. Extracted text is then handled using the "llama-3.1-70b-versatile" model on Groq. The model is informed of its abilities (take picture, etc) and instructed to use specific tokens (ex: `<TAKE_PICTURE>`) if the action is requested by the user.

Note that all calls to the Groq API are heavily compartmentalized into seperate functions. This was designed to all for easy swapping between model API and potentially to local models.

## Haar Cascade Classifier

A haar cascade classifier was trained to implement hand recogitnion in the dataset.
[Hagrid dataset](https://github.com/hukenovs/hagrid) was used for positive hand pictures.
["Random Images for Image classification" dataset](https://www.kaggle.com/datasets/ezzzio/random-images) was used for negative images.

OpenCV was used for the training process. OpenCVJS was used in the initial implementation before getting removed due to model accuracy.

Model Accuracy: bad

Post mortem:
After training the model and testing with the live video feed the accuracy was poor. I believe this was due to an insufficient amount of negative images. The ratio of positive to negative was 4:1; I believe this led to the model having a poor understanding of what is _not_ a hand. This could be seen by the model overly classifying random items in the background as a hand during testing.

If I was to train this model again I would greatly up the amount of negative images and also make them more "relevant" to the camera feed. Many of the images were extremely unlikely to appear in the live camear feed (ex: random nature pictures). A dataset of random people sitting infront of their camera without showing their hands would be a better negative image dataset.

## Running

1. Git clone the repo
2. Add a `GROQ_API_KEY` to .env file. [https://console.groq.com/keys](https://console.groq.com/keys)
3. `npm install`
4. `npm run dev`
5. Talk to the computer with "Hey Computer..."
