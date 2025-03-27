# Earthquake Monitor

## How to build apk

1. Install Node.js and npm.

2. Install dependencies

   ```bash
   npm install
   ```

3. Install EAS CLI.

   ```bash
    npm install -g eas-cli
   ```

4. Sign up to [expo.dev](https://expo.dev) and login via CLI.

   ```bash
    eas login
   ```

5. Run a build.

   ```bash
    eas build -p android --profile preview
   ```
