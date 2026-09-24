#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
WORK="$ROOT/.jitpack-gamepilot"
rm -rf "$WORK"
mkdir -p "$WORK"

base64 -d "$ROOT/gamepilot-build/GamePilot-0.5-direct-lean.zip.b64" > "$WORK/GamePilot-0.5-direct-lean.zip"
mkdir -p "$WORK/src"
unzip -q "$WORK/GamePilot-0.5-direct-lean.zip" -d "$WORK/src"
PROJECT="$WORK/src"
test -f "$PROJECT/tools/build_native.py"
test -f "$PROJECT/app/src/main/AndroidManifest.xml"

# Use current Android command-line tools. This is the same remote SDK setup
# previously used to build GamePilot 0.4.
SDKROOT="$WORK/android-sdk"
TOOLS_ZIP="$WORK/commandlinetools-linux.zip"
TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-15859902_latest.zip"
TOOLS_SHA256="4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583"
mkdir -p "$SDKROOT/cmdline-tools"
curl -fL --retry 3 --retry-delay 2 "$TOOLS_URL" -o "$TOOLS_ZIP"
echo "$TOOLS_SHA256  $TOOLS_ZIP" | sha256sum -c -
unzip -q "$TOOLS_ZIP" -d "$WORK/cmdline-tools-unpacked"
mv "$WORK/cmdline-tools-unpacked/cmdline-tools" "$SDKROOT/cmdline-tools/latest"
export ANDROID_HOME="$SDKROOT"
export ANDROID_SDK_ROOT="$SDKROOT"
export PATH="$SDKROOT/cmdline-tools/latest/bin:$SDKROOT/platform-tools:$SDKROOT/build-tools/35.0.0:$PATH"
SDKMGR="$SDKROOT/cmdline-tools/latest/bin/sdkmanager"

yes | "$SDKMGR" --sdk_root="$SDKROOT" --licenses >/dev/null 2>&1 || true
"$SDKMGR" --sdk_root="$SDKROOT" "platforms;android-35" "build-tools;35.0.0" "platform-tools"

echo "JAVA_HOME=${JAVA_HOME:-unset}"
java -version
"$SDKMGR" --version

cd "$PROJECT"
python3 tools/build_native.py
APK="$PROJECT/app/build/native/GamePilot-0.5.apk"
test -s "$APK"
"$SDKROOT/build-tools/35.0.0/apksigner" verify --verbose "$APK"
"$SDKROOT/build-tools/35.0.0/aapt" dump badging "$APK" | head -n 8

VERSION_VALUE="${VERSION:-${GIT_COMMIT:-0.5.0}}"
GROUP_VALUE="${GROUP:-com.github.brianpt1984}"
ARTIFACT_VALUE="${ARTIFACT:-1}"
GROUP_PATH="${GROUP_VALUE//./\/}"
M2="$HOME/.m2/repository/$GROUP_PATH/$ARTIFACT_VALUE/$VERSION_VALUE"
mkdir -p "$M2"

# APK is ZIP/JAR-compatible, so publish byte-identical .jar and .apk copies
# so JitPack's Maven artifact collector exposes the build output.
cp "$APK" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.apk"
cp "$APK" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.jar"

cat > "$ROOT/pom.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>$GROUP_VALUE</groupId>
  <artifactId>$ARTIFACT_VALUE</artifactId>
  <version>$VERSION_VALUE</version>
  <packaging>jar</packaging>
  <name>GamePilot 0.5 APK</name>
</project>
EOF
cp "$ROOT/pom.xml" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.pom"

if command -v mvn >/dev/null 2>&1; then
  mvn -q install:install-file \
    -Dfile="$APK" \
    -DgroupId="$GROUP_VALUE" \
    -DartifactId="$ARTIFACT_VALUE" \
    -Dversion="$VERSION_VALUE" \
    -Dpackaging=jar \
    -DpomFile="$ROOT/pom.xml"
  cp "$APK" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.apk"
fi

mkdir -p "$ROOT/target"
cp "$APK" "$ROOT/target/$ARTIFACT_VALUE-$VERSION_VALUE.apk"
cp "$APK" "$ROOT/target/$ARTIFACT_VALUE-$VERSION_VALUE.jar"
sha256sum "$APK" | tee "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.sha256" "$ROOT/target/GamePilot-0.5.sha256"
ls -lh "$APK" "$M2"/* "$ROOT/target"/*
echo "GAMEPILOT_APK_BUILT=$APK"
