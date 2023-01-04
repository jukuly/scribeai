## ScribeAI: An AI powered Writing Assistant

This is a AI Writing Assistant powered by the OpenAI API. It includes features such as text completion based on the context and keywords, translation, rephrasing and grammar correction. It is built using the Electron framework and the React library.

Dependencies (npm packages):
- electron
- react
- typescript
- electron-is-dev
- node-key-sender
- sass
- firebase (auth, firestore, functions)
- react-firebase-hooks
- react-router-dom
- path

Run: `npm run electron-serve`
Build: `npm run electron-build`

Once the app is launched, you can highlight some text and use the shortcut: Ctrl+Shift+Space to open the writing assistant pop-up. Also, you can close the main window, the app will just be minimized in the system tray.

You're also gonna need an OpenAI API key and a firebase project.
Then, you'll be able to setup two .env files, one in the ./functions directory and one in the root directory.

The first one should contain the OpenAI API key: 
`OPENAI_KEY=your_openai_api_key`

The second one should contain the firebase credentials: 
`REACT_APP_FIREBASE_KEY=your_firebase_api_key
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messagins_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id`