import { useRef, useState } from "react";
import { WebAudioEngine } from "@synervoz/switchboard-sdk-js";
import AuthHydrater from "../tools/AuthHydrater";
import { agoraExample } from "./exampleJson";
import "./styles.css";

// We define where the extensions that are required for the Switchbaord JSON graph reside.
const EXTENSION_LOCATIONS = [
  {
    path: `https://cdn.jsdelivr.net/npm/@synervoz/switchboard-sdk-js-extensions@0.0.1/dist`,
    extensionsToLoad: ["Agora", "Superpowered"],
  },
];

export default function App() {
  //
  const webAudioEngine = useRef(
    new WebAudioEngine({ extensionLocations: EXTENSION_LOCATIONS }),
  );
  const [userJson, setUserJson] = useState(
    JSON.stringify(agoraExample, null, 2),
  );

  const [applicationState, setApplicationState] = useState("INITIAL");
  const runJSON = async () => {
    // The AuthHydrater allows us to populate the Agora Token from our own
    // internal backend and also populatesSuperpowered license key
    // You should use your own backend here...
    const { json } = await AuthHydrater(JSON.parse(userJson));
    console.log(json);
    // Start the Switchboard Web Audio Engine with the hydrated JSON
    await webAudioEngine.current.initialize(json);

    // Grab the microphone node and enable audio input
    const inputNode = webAudioEngine.current.getAudioNode("inputNode");
    inputNode.setParameters({ captureEnabled: true });
    // Resume (start) the Underlying WebAudio AudioContext so we can hear things...
    webAudioEngine.current.resume();

    // Setup listeners to receive Agora video streams
    startAgoraVideoListeners();
    setApplicationState("RUNNING");
  };

  /*
    Here we are using the agoraSourceNode in the Switchboard graph to listen 
    for video publishes and putting them in the DOM
  */
  const startAgoraVideoListeners = async () => {
    const agoraSinkNode =
      webAudioEngine.current.getAudioNode("agoraSourceNode");
    const agoraClient = agoraSinkNode.extension.agoraEngine;
    agoraClient.on("user-published", async (user, mediaType) => {
      if (mediaType === "video") {
        await agoraClient.subscribe(user, mediaType);
        const tracks = [user.videoTrack.getMediaStreamTrack()];
        const peerContainer = document.createElement("div");
        peerContainer.className = "peer-container";
        const peerLabel = document.createElement("p");
        const peerVideo = document.createElement("video");
        peerLabel.innerText = `Peer: ${user.uid}`;
        peerVideo.srcObject = new MediaStream(tracks);

        peerContainer.appendChild(peerLabel);
        peerContainer.appendChild(peerVideo);
        document.getElementById("peer-videos").appendChild(peerContainer);
        peerVideo.play();
      }
    });
    agoraClient.on("user-unpublished", async (user) => {
      // Removing the HTML video from the DOM if outside the scope of this demonstration code
    });
  };

  /*
    Here we are using the agoraSinkNode in the Switchboard graph to accesss 
    the underlying Agora SDK and send video directly with the Agora SDK
  */
  const publishWebcamToAgora = async () => {
    const agoraSourceNode =
      webAudioEngine.current.getAudioNode("agoraSinkNode");
    const AgoraRTC = agoraSourceNode.extension.AgoraRTC;
    const agoraClient = agoraSourceNode.extension.agoraEngine;
    const userVideoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: true,
    });

    const agoraCustomVideoTrack = AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: userVideoStream.getVideoTracks()[0],
    });
    agoraClient.publish(agoraCustomVideoTrack);
  };

  const handleUpdateUserJson = (e) => {
    setUserJson(e.target.value);
  };

  return (
    <div className="App">
      <img
        width="300"
        src="https://docs.switchboard.audio/img/switchboard-sdk-logo-text.svg"
      />
      <h1>Agora example</h1>
      <textarea
        onChange={handleUpdateUserJson}
        value={userJson}
        style={{ fontFamily: "monospace" }}
        cols="60"
        rows="20"
      ></textarea>
      <button onClick={runJSON}>Start Audio Engine</button>
      <p>
        <b>State: {applicationState}</b>
      </p>
      <button onClick={publishWebcamToAgora}>Start video transmission</button>
      <h4>Agora Channel Videos</h4>
      <div id="peer-videos"></div>
    </div>
  );
}
