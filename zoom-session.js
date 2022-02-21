const KJUR = require("jsrsasign");

function generateVideoToken(sdkKey, sdkSecret, topic, password = "") {
  let signature = "";
  const iat = Math.round(new Date().getTime() / 1000);
  const exp = iat + 60 * 60 * 2;
  const oHeader = { alg: "HS256", typ: "JWT" };
  const oPayload = {
    app_key: sdkKey,
    iat,
    exp,
    tpc: topic,
    pwd: password,
  };
  const sHeader = JSON.stringify(oHeader);
  const sPayload = JSON.stringify(oPayload);
  signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  return signature;
}

module.exports = function (RED) {
  function ZoomSessionConfig(node) {
    RED.nodes.createNode(this, node);
    this.sdkKey = node.sdkKey;
    this.sdkSecret = node.sdkSecret;
  }

  RED.nodes.registerType("zoom-session-config", ZoomSessionConfig);

  function ZoomeSessionNode(config) {
    var node = this;
    RED.nodes.createNode(this, config);
    this.zoomSessionConfig = RED.nodes.getNode(config.zoomSessionConfig);

    if (this.zoomSessionConfig) {
      node.on("input", (msg) => {
        const session = generateVideoToken(
          this.zoomSessionConfig.sdkKey,
          this.zoomSessionConfig.sdkSecret,
          this.zoomSessionConfig.name,
          this.zoomSessionConfig.password
        );

        msg.payload = {
          session,
        };
        node.send(msg);
      });
    } else {
      node.send({ payload: "No session configured" });
    }
  }

  RED.nodes.registerType("zoom-session", ZoomeSessionNode);
};
