// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user.model");

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_CALLBACK_URL
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       let user = await User.findOne({ where: { googleId: profile.id } });
//       if (!user) {
//         user = await User.create({
//           userName: profile.displayName,
//           email: profile.emails[0].value,
//           googleId: profile.id
//         });
//       }
//       return done(null, user);
//     } catch (err) {
//       return done(err, null);
//     }
//   }
// ));







// // config/passport.js
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const User = require("../models/user.model");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails[0].value;

//         // 1️⃣ Find user by email (IMPORTANT)
//         let user = await User.findOne({ where: { email } });

//         if (user) {
//           // 2️⃣ Link Google account if not already linked
//           if (!user.googleId) {
//             user.googleId = profile.id;
//             await user.save();
//           }
//         } else {
//           // 3️⃣ Create new user
//           user = await User.create({
//             userName: profile.displayName,
//             email,
//             googleId: profile.id
//           });
//         }

//         return done(null, user);

//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// module.exports = passport;




const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },

    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails[0].value;
        const avatar = profile.photos[0].value;
        const name = profile.displayName;

        // 1️⃣ Check if user already exists
        let user = await User.findOne({ where: { email } });

        if (user) {

          // 2️⃣ If existing user but Google not linked
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = avatar;
            await user.save();
          }

        } else {

          // 3️⃣ Create new user
          user = await User.create({
            userName: name,
            email: email,
            googleId: profile.id,
            avatar: avatar
          });

        }

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;