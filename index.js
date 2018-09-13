import React, { createContext, Component } from "react";
import { device } from "./aws-iot-device-sdk-js-react-native";
import PropTypes from "prop-types";
const { Provider, Consumer } = createContext({});
class AWSIOTProvider extends Component {
  state = {
    send: message => {
      return this.send(message);
    }
  };
  componentDidMount() {
    if (!this.client && this.props.region) {
      this.client = device({
        region: this.props.region,
        protocol: "wss",
        accessKeyId: this.props.accessKey,
        secretKey: this.props.secretKey,
        sessionToken: this.props.sessionToken,
        port: 443,
        host: this.props.iotEndpoint
      });
      this.client.on("connect", () => {
        this.setState({ status: "connected" });

        this.client.subscribe(this.props.iotTopic);
      });
      this.client.on("error", error => {
        console.log("ERROR>", error);
      });
      this.client.on("message", this.onMessage.bind(this));
      this.client.on("close", this.onClose.bind(this));
    }
  }
  send(message) {
    this.client.publish(this.props.iotTopic, message); // send messages
  }
  onMessage(topic, message) {
    this.setState({ message, topic });
  }
  onClose(topic) {
    this.setState({ topic, status: "closed" });
  }
  render() {
    return (
      <Provider value={this.state}>
        {typeof this.props.children == "function" ? (
          <Consumer>{this.props.children}</Consumer>
        ) : (
          this.props.children
        )}
      </Provider>
    );
  }
}
AWSIOTProvider.propTypes = {
  region: PropTypes.string.isRequired,
  accessKey: PropTypes.string.isRequired,
  secretKey: PropTypes.string.isRequired,
  sessionToken: PropTypes.string.isRequired,
  iotEndpoint: PropTypes.string.isRequired
};
AWSIOTProvider.defaultProps = {
  region: "",
  accessKey: "",
  secretKey: "",
  sessionToken: "",
  iotEndpoint: ""
};
export { AWSIOTProvider, Consumer as AWSIOTConsumer };
