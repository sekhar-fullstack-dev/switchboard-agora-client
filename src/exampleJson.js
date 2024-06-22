export const agoraExample = {
  title: "Agora Vocal chain with video",
  nodes: [
    {
      type: "UserInputSource",
      id: "inputNode",
    },
    {
      type: "Superpowered.AutomaticVocalPitchCorrection",
      id: "autotuneNode",
    },
    {
      type: "Superpowered.Compressor",
      id: "compressorNode",
    },
    {
      type: "Superpowered.Reverb",
      id: "reverbNode",
    },
    {
      type: "Agora.Sink",
      id: "agoraSinkNode",
      config: {
        token: "",
        channelId: "webrtc-vocals",
        peerId: "Thomas",
      },
    },
    {
      type: "Agora.Source",
      id: "agoraSourceNode",
      config: {
        appId: "",
        token: "",
        channelId: "webrtc-vocals",
        peerId: "Thomas",
      },
    },
    {
      type: "RNNoise.NoiseFilter",
      id: "noiseFilterNode",
    },
    {
      id: "outputNode",
      type: "OutputNode",
    },
  ],
  connections: [
    {
      sourceNode: "autotuneNode",
      destinationNode: "compressorNode",
    },
    {
      sourceNode: "compressorNode",
      destinationNode: "reverbNode",
    },
    {
      sourceNode: "reverbNode",
      destinationNode: "agoraSinkNode",
    },
    {
      sourceNode: "agoraSourceNode",
      destinationNode: "outputNode",
    },
    {
      sourceNode: "reverbNode",
      destinationNode: "outputNode",
    },
    {
      sourceNode: "inputNode",
      destinationNode: "noiseFilterNode",
    },
    {
      sourceNode: "noiseFilterNode",
      destinationNode: "autotuneNode",
    },
  ],
};

export const toneExample = {
  title: "SineGeneratorNode Example",
  nodes: [
    {
      id: "sineGenerator",
      type: "Switchboard.SineGenerator",
    },
    {
      id: "outputNode",
      type: "OutputNode",
    },
  ],
  connections: [
    {
      sourceNode: "sineGenerator",
      destinationNode: "outputNode",
      sourceBusIndex: 0,
      destinationBusIndex: 0,
    },
  ],
};
