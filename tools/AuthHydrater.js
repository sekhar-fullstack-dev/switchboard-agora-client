const AGORA_TOKEN_ENDPOINT = "https://api-dev.synervoz.com/rooms";
const AGORA_CLIENT_ID = "SwitchboardAudioIDE";
const AGORA_CLIENT_SECRET = "LeTaraYOvIERMOnITHUsANAtERsorESTiERYOPaRaFToRk";
const AGORA_APP_ID = "ee7e3a59760643e5995e3c4bb643f370";
const SUPEPOWERED_TRIAL_LICENSE_KEY =
  "ExampleLicenseKey-WillExpire-OnNextUpdate";

const AuthHydrater = async (json) => {
  // console.log('Running AuthHydrater');
  const nodeTypesHydrated = new Set();
  if (json?.nodes.length) {
    for (const node of json.nodes) {
      if (node.type.includes("Superpowered")) {
        if (!node.config) node.config = {};
        node.config.licenseKey = SUPEPOWERED_TRIAL_LICENSE_KEY;
      }
      if (node.type.includes("Agora")) {
        if (!node.config) node.config = {};
        if (!node.config.appId || !node.config.token) {
          const requestPayload = {
            name: node.config.channelId,
            password: null,
            clientId: AGORA_CLIENT_ID,
            clientSecret: AGORA_CLIENT_SECRET,
            type: "agora",
          };

          const response = await fetch(AGORA_TOKEN_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(requestPayload),
            headers: [["Content-Type", "application/json; charset=utf-8"]],
          });
          const jsonResponse = await response.json();
          node.config.appId = AGORA_APP_ID;
          node.config.token = jsonResponse.agora.token;
          nodeTypesHydrated.add(node.type);
        }
      }
    }
  }

  return { json, nodeTypesHydrated: Array.from(nodeTypesHydrated) };
};

export default AuthHydrater;
