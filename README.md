# MAX Human Pose Estimator TensorFlow.js: Veremax

Veremax is a video theremin that allows anyone to make music just by waving their arms in front of a webcam.

It is based on the [Veremin](https://github.com/vabarbosa/veremin) but modified to use the [Human Pose Estimator](https://developer.ibm.com/exchanges/models/all/max-human-pose-estimator) model from the [Model Asset eXchange (MAX)](https://developer.ibm.com/exchanges/models). The Human Pose Estimator model is [converted](https://github.ibm.com/va/max-human-pose-estimator-tfjs#converting-the-model) to the [TensorFlow.js](https://js.tensorflow.org) web-friendly format. It is a deep learning model trained to detect humans and their poses in a given image. 

The web application attaches to the video stream from your web camera. The Human Pose Estimator model is used to predict the location of your wrists within the video. The application takes the predictions and converts them to tones in the browser or to MIDI values which get sent to a connected MIDI device.

Browsers must allow [access to the webcam](https://caniuse.com/#feat=stream) and support the [Web Audio API](https://caniuse.com/#feat=audio-api). Optionally, to integrate with a MIDI device the browser will need to support the [Web MIDI API](https://caniuse.com/#feat=midi) (e.g., Chrome browser version 43 or later).


## Flow

1. User stands in front of webcam and moves their arm
1. Web application captures video frame and sends to the model
1. Model return a prediction of the estimated poses in the frame
1. Web application process the prediction
1. Web application overlays the skeleton of the estimated pose on the video
1. Web application converts position of the user's wrists from the estimated poses to MIDI note
1. MIDI note is sent to connected MIDI device or sound is played in the browser


## Included Components

* [MAX Human Pose Estimator](https://developer.ibm.com/exchanges/models/all/max-human-pose-estimator): A machine learning model which detects human poses
* [TensorFlow.js](https://js.tensorflow.org/): A JavaScript library for training and deploying ML models in the browser and on Node.js


## Featured Technologies

* [Web MIDI API](https://www.w3.org/TR/webmidi): An API supporting the MIDI protocol, enabling web applications to enumerate and select MIDI input and output devices on the client system and send and receive MIDI messages
* [Web Audio API](https://www.w3.org/TR/webaudio): A high-level Web API for processing and synthesizing audio in web applications
* [Tone.js](https://tonejs.github.io/): A framework for creating interactive music in the browser


## Steps

Ways to run the Veremax:

- [Deploy to IBM Cloud](https://github.ibm.com/va/max-human-pose-estimator-tfjs#deploy-to-ibm-cloud)
- [Run locally](https://github.ibm.com/va/max-human-pose-estimator-tfjs#run-locally)

### Deploy to IBM Cloud

Pre-requisites:

- Get an [IBM Cloud account](https://console.bluemix.net/)
- Install/Update the [IBM Cloud CLI](https://console.bluemix.net/docs/cli/reference/ibmcloud/download_cli.html#install_use)
- [Configure and login](https://console.bluemix.net/docs/cli/index.html#overview) to the IBM Cloud using the CLI

To deploy to the IBM Cloud, from a terminal run:

1. Clone the `max-human-pose-estimator-tfjs` locally:

    ```
    $ git clone https://github.ibm.com/va/max-human-pose-estimator-tfjs
    ```

1. Change to the directory of the cloned repo:

    ```
    $  cd max-human-pose-estimator-tfjs
    ```

1. Log in to your IBM Cloud account:

    ```
    $ ibmcloud login
    ```

1. Target a Cloud Foundry org and space:

    ```
    $ ibmcloud target --cf
    ```

1. Push the app to IBM Cloud:

    ```
    $ ibmcloud cf push
    ```
    Deploying can take a few minutes.

1. View the app with a browser at the URL listed in the output.

    > **Note**: Depending on your browser, you may need to access the app using the **`https`** protocol instead of the **`http`**

### Run locally

To run the app locally:

1. From a terminal, clone the `max-human-pose-estimator-tfjs` locally:

    ```
    $ git clone https://github.ibm.com/va/max-human-pose-estimator-tfjs
    ```

1. Point your web server to the cloned repo directory (`/max-human-pose-estimator-tfjs`)

    > For example:  
    > - using the **[Web Server for Chrome](https://github.com/kzahel/web-server-chrome)** extension (available from the [Chrome Web Store](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb))
    >   
    >   1. Go to your Chrome browser's Apps page (chrome://apps)
    >   1. Click on the **Web Server**
    >   1. From the Web Server, click **CHOOSE FOLDER** and browse to the cloned repo directory
    >   1. Start the Web Server
    >   1. Make note of the **Web Server URL(s)** (e.g., http://127.0.0.1:8887)
    >   
    > - using the Python **HTTP server** module
    >   
    >   1. From a terminal shell, go to the cloned repo directory
    >   1. Depending on your Python version, enter one of the following commands:
    >       - Python 2.x: `python -m SimpleHTTPServer 8080`
    >       - Python 3.x: `python -m http.server 8080`
    >   1. Once started, the Web Server URL should be http://127.0.0.1:8080
    >   

1. From your browser, go to the Web Server's URL


## Using the app

For best results use in a well-lit area with good contrast between you and the background. And stand back from the webcam so at least half of your body appears in the video.

At a minimum, your browsers must allow [access to the web camera](https://caniuse.com/#feat=stream) and support the [Web Audio API](https://caniuse.com/#feat=audio-api).

In addition, if it supports the [Web MIDI API](https://caniuse.com/#feat=midi), you may connect a MIDI synthesizer to your computer. If you do not have a MIDI synthesizer you can download and run a software synthesizer such as [SimpleSynth](http://notahat.com/simplesynth/).

If your browser does not support the Web MIDI API or no (hardware or software) synthesizer is detected, the app defaults to using the Web Audio API to generate tones in the browser.

Open your browser and go to the app URL. Depending on your browser, you may need to access the app using the **`https`** protocol instead of the **`http`**. You may also have to accept the browser's prompt to allow access to the web camera. Once access is allowed, the Human Pose Estimator model gets loaded.

After the model is loaded, the video stream from the web camera will appear and include an overlay with skeletal information detected by the model. The overlay will also include two adjacent zones/boxes. When your wrists are detected within each of the zones, you should here some sound.

- Move your right hand/arm up and down (in the right zone) to generate different notes
- Move your left hand/arm left and right (in the left zone) to adjust the velocity of the note.

Click on the Controls icon (top right) to open the control panel. In the control panel you are able to change MIDI devices (if more than one is connected), configure post-processing settings, set what is shown in the overlay, and configure additional options.


## Converting the model

The converted MAX Human Pose Estimator model can be found in the [`model`](https://github.ibm.com/va/max-human-pose-estimator-tfjs/tree/master/model) directory. To convert the model to the TensorFlow.js web friendly format the following steps below.

> **Note**: The Human Pose Estimator model is a frozen graph. The current version of the `tensorflowjs_converter` no longer supports frozen graph models. To convert frozen graphs it is recommended to use an older version of the Tensorflow.js converter (0.8.0) and then run the `pb2json` script from Tensorflow.js converter 1.x.

1. Install the [tensorflowjs 0.8.0](https://pypi.org/project/tensorflowjs/0.8.0/) Python module
1. Download and extract the pre-trained [Human Pose Estimator model](http://max-assets.s3.us.cloud-object-storage.appdomain.cloud/human-pose-estimator/1.0/assets.tar.gz)
1. From a terminal, run the `tensorflowjs_converter`:

    ```
    tensorflowjs_converter \
        --input_format=tf_frozen_model \
        --output_node_names='Openpose/concat_stage7' \
        {model_path} \
        {pb_model_dir}
    ```

    where

    - **{model_path}** is the path to the extracted model  
    - **{pb_model_dir}** is the directory to save the converted model artifacts
    - **output_node_names** (`Openpose/concat_stage7`) is obtained by inspecting the model’s graph. One useful and easy-to-use visual tool for viewing machine learning models is [Netron](https://github.com/lutzroeder/Netron).

1. Clone and install the `tfjs-converter` TypeScipt scripts

    ```
    $ git clone git@github.com:tensorflow/tfjs-converter.git
    $ cd tfjs-converter
    $ yarn
    ```

1. Run the `pb2json` script:

    ```
    yarn ts-node tools/pb2json_converter.ts {pb_model_dir}/ {json_model_dir}/
    ```

    where

    - **{pb_model_dir}** is the directory to converted model artifacts from step 3
    - **{json_model_dir}** is the directory to save the updated model artifacts


When the completed, the contents of **{json_model_dir}** will be the web friendly format of the Human Pose Estimator model for TensorFlow.js 1.x. And the **{pb_model_dir}** will be the web friendly format for TensorFlow.js 0.15.x.


## Links

 - Bring Machine Learning to the Browser With TensorFlow.js - [Part I](https://medium.com/ibm-watson-data-lab/bring-machine-learning-to-the-browser-with-tensorflow-js-part-i-16924457291c), [Part II](https://medium.com/ibm-watson-data-lab/bring-machine-learning-to-the-browser-with-tensorflow-js-part-ii-7555ed9a999e), [Part III](https://medium.com/ibm-watson-data-lab/bring-machine-learning-to-the-browser-with-tensorflow-js-part-iii-62d2b09b10a3)
 - [Model Asset eXchange](https://developer.ibm.com/exchanges/models/)
 - [IBM Cloud](https://console.bluemix.net/)
 - [Getting started with the IBM Cloud CLI](https://console.bluemix.net/docs/cli/index.html#overview)
 - [Prepare the app for deployment - IBM Cloud](https://console.bluemix.net/docs/runtimes/nodejs/getting-started.html#prepare)
 - [Playing with MIDI in JavaScript](https://medium.com/swinginc/playing-with-midi-in-javascript-b6999f2913c3)
 - [Introduction to Web Audio API](https://css-tricks.com/introduction-web-audio-api)
 - Human pose estimation using OpenPose with TensorFlow - [Part 1](https://arvrjourney.com/human-pose-estimation-using-openpose-with-tensorflow-part-1-7dd4ca5c8027), [Part II](https://arvrjourney.com/human-pose-estimation-using-openpose-with-tensorflow-part-2-e78ab9104fc8)


## License

This code pattern is licensed under the Apache Software License, Version 2.  Separate third party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1 (DCO)](https://developercertificate.org/) and the [Apache Software License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache Software License (ASL) FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
