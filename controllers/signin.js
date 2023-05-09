const jwt = require("jsonwebtoken");
const redis = require("redis");

//setup Redis:
const redisClient = redis.createClient(process.env.REDIS_URI);

const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      return bcrypt
        .compare(password, data[0].hash)
        .then((response) => {
          if (response) {
            return db
              .select("*")
              .from("users")
              .where("email", "=", email)
              .then((user) => {
                return user[0];
              })
              .catch((err) => Promise.reject("unable to get user"));
          } else {
            return Promise.reject("failed to login");
          }
        })
        .catch((err) => Promise.reject("wrong credentials"));
    })
    .catch((err) => Promise.reject("wrong credentials"));
};

const getAuthTokenID = (req, res) => {
  const { authorization } = req.headers;
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.json({ id: reply });
  });
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: "2 days",
  });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSessions = (user) => {
  // JWT token, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token: token };
    })
    .catch(console.log);
};

const signinAuthentication = (req, res, db, bcrypt) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenID(req, res)
    : handleSignin(req, res, db, bcrypt)
        .then((data) => {
          return data.id && data.email
            ? createSessions(data)
            : Promise.reject("unvalid data");
        })
        .then((session) => res.json(session))
        .catch((err) => res.status(400).json(err));
};

module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient,
};
