const fs = require("fs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const loaderOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
const packageDefinition = protoLoader.loadSync(
  "lightning.proto",
  loaderOptions
);
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
const macaroon = fs.readFileSync("./admin.macaroon").toString("hex");
process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";
const lndCert = fs.readFileSync("./tls.cert");
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (
  args,
  callback
) {
  let metadata = new grpc.Metadata();
  metadata.add("macaroon", macaroon);
  callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let lightning = new lnrpc.Lightning("44.238.103.25:10009", creds);
let request = {};

var getInfo = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.getInfo(request, (err, response) => {
      console.log(err);
      console.log(response);
      resolve(response);
    });
  });
};

var newAddress = () => {
  return new Promise((resolve, reject) => {
    var request = {
      type: "",
    };
    lightning.newAddress(request, function (err, response) {
      resolve(response);
    });
  });
};

var walletBalance = () => {
  return new Promise((resolve, reject) => {
    request = {};
    lightning.walletBalance(request, function (err, response) {
      resolve(response);
    });
  });
};

var connectPeer = (pub_key) => {
  addr = pub_key.split("@");
  return new Promise((resolve, reject) => {
    var request = {
      addr: {
        pubkey: addr[0],
        host: addr[1],
      },
      perm: true,
    };
    lightning.connectPeer(request, function (err, response) {
      resolve(response);
    });
  });
};

var listPeers = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.listPeers(request, function (err, response) {
      resolve(response);
    });
  });
};

var disconnectPeer = (pub_key) => {
  return new Promise((resolve, reject) => {
    var request = {
      pub_key,
    };
    lightning.disconnectPeer(request, function (err, response) {
      resolve(response);
    });
  });
};

var openChannel = (info) => {
  return new Promise((resolve, reject) => {
    console.log(info);
    var request = {
      node_pubkey_string: info.pub_key,
      local_funding_amount: parseInt(info.local_fund),
      push_sat: parseInt(info.push_fund),
      target_conf: 1,
      private: false,
      min_confs: 3,
      spend_unconfirmed: false,
    };
    lightning.openChannelSync(request, function (err, response) {
      resolve(response);
    });
  });
};

var channelBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function (err, response) {
      resolve(response);
    });
  });
};

var listChannels = () => {
  return new Promise((resolve, reject) => {
    var request = {
      active_only: true,
    };
    lightning.listChannels(request, function (err, response) {
      resolve(response);
    });
  });
};

var addInvoice = (amt_paid_sat) => {
  return new Promise((resolve, reject) => {
    var request = {
      value: amt_paid_sat,
      amt_paid_sat,
    };
    lightning.addInvoice(request, function (err, response) {
      resolve(response);
    });
  });
};

var sendPayment = (body) => {
  return new Promise((resolve, reject) => {
    console.log(body.pub_key);
    var request = {
      // dest: <bytes>,
      // dest_string: <string>,
      // amt: <int64>,
      // payment_hash: <bytes>,
      // payment_hash_string: <string>,
      payment_request: body.pub_key,
      // final_cltv_delta: <int32>,
      // fee_limit: <FeeLimit>,
      // outgoing_chan_id: <uint64>,
      // cltv_limit: <uint32>,
      // dest_tlv: <array DestTlvEntry>,
    };
    lightning.sendPaymentSync(request, function (err, response) {
      resolve(response);
    });
  });
};

var closeChannel = (info) => {
  return new Promise((resolve, reject) => {
    fund = info.split(":");
    var request = {
      channel_point: {
        funding_txid_str: fund[0],
        output_index: parseInt(fund[1]),
      },
    };
    var call = lightning.closeChannel(request);
    call.on("data", function (response) {
      resolve(response);
    });
  });
};

var channalBalance = () => {
  return new Promise((resolve, reject) => {
    var request = {};
    lightning.channelBalance(request, function (err, response) {
      resolve(response);
    });
  });
};

(async () => {
  const res = await getInfo();
  console.log(res);
})();