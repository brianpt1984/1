#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
WORK="$ROOT/.jitpack-gamepilot"
rm -rf "$WORK"
mkdir -p "$WORK"

base64 -d "$ROOT/gamepilot-build/GamePilot-0.4-input-patch.zip.b64" > "$WORK/GamePilot-0.4-input-patch.zip"
unzip -q "$WORK/GamePilot-0.4-input-patch.zip" -d "$WORK/src"
PROJECT="$WORK/src/GamePilot-0.4-input-patch"
test -f "$PROJECT/app/build.gradle"

# Ensure Android 35 is present when sdkmanager is available.
SDKMGR="$(command -v sdkmanager || true)"
if [ -z "$SDKMGR" ] && [ -n "${ANDROID_HOME:-}" ]; then
  SDKMGR="$(find "$ANDROID_HOME" -type f -name sdkmanager 2>/dev/null | head -n 1 || true)"
fi
if [ -n "$SDKMGR" ]; then
  yes | "$SDKMGR" --licenses >/dev/null 2>&1 || true
  "$SDKMGR" "platforms;android-35" "build-tools;35.0.0" >/dev/null
fi

echo "JAVA_HOME=${JAVA_HOME:-unset}"
java -version
gradle --version

cd "$PROJECT"
gradle --no-daemon --stacktrace assembleDebug
APK="$PROJECT/app/build/outputs/apk/debug/app-debug.apk"
test -s "$APK"

VERSION_VALUE="${VERSION:-${GIT_COMMIT:-0.4.0}}"
GROUP_VALUE="${GROUP:-com.github.brianpt1984}"
ARTIFACT_VALUE="${ARTIFACT:-1}"
GROUP_PATH="${GROUP_VALUE//./\/}"
M2="$HOME/.m2/repository/$GROUP_PATH/$ARTIFACT_VALUE/$VERSION_VALUE"
mkdir -p "$M2"

# Publish the real APK extension plus a byte-identical .jar fallback so
# JitPack will retain the artifact even on clients expecting JVM packaging.
cp "$APK" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.apk"
cp "$APK" "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.jar"

cat > "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.pom" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>$GROUP_VALUE</groupId>
  <artifactId>$ARTIFACT_VALUE</artifactId>
  <version>$VERSION_VALUE</version>
  <packaging>jar</packaging>
  <name>GamePilot 0.4 APK</name>
</project>
EOF

sha256sum "$APK" | tee "$M2/$ARTIFACT_VALUE-$VERSION_VALUE.sha256"
ls -lh "$APK" "$M2"/*
echo "GAMEPILOT_APK_BUILT=$APK"
