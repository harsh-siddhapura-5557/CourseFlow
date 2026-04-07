import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, RefreshCw, AlertCircle } from "lucide-react-native";

// Since we can't easily import HTML in Expo like in web,
// we'll use a string template or a more robust method for production.
// For this demo, I'll use the content from the HTML file.

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Course Content</title>
    <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; background: #f8fafc; color: #1e293b; }
        .card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
        .instructor { color: #6366f1; font-weight: 600; margin-bottom: 20px; }
        .video { background: #000; aspect-ratio: 16/9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 20px; }
        button { background: #6366f1; color: white; border: none; padding: 15px; border-radius: 12px; font-weight: bold; width: 100%; font-size: 16px; margin-top: 20px; }
    </style>
</head>
<body>
    <div id="course-title" class="title">Loading...</div>
    <div id="course-instructor" class="instructor"></div>
    <div class="card">
        <div class="video" onclick="window.ReactNativeWebView.postMessage('VIDEO_PLAY')">▶ Play Lesson</div>
        <div id="course-description"></div>
        <button onclick="window.ReactNativeWebView.postMessage('LESSON_COMPLETE')">Complete Lesson</button>
    </div>
    <script>
        window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            document.getElementById('course-title').innerText = data.title;
            document.getElementById('course-instructor').innerText = 'by ' + (data.instructor ? data.instructor.name.first + ' ' + data.instructor.name.last : 'Unknown');
            document.getElementById('course-description').innerText = data.description;
        });
    </script>
</body>
</html>
`;

export default function WebViewScreen() {
  const { courseData } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const onMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === "LESSON_COMPLETE") {
      Alert.alert("Congratulations!", "You have completed this lesson.", [
        { text: "Back to Course", onPress: () => router.back() },
      ]);
    } else if (message === "VIDEO_PLAY") {
      Alert.alert("Notice", "Video player would start here in a real app.");
    }
  };

  useEffect(() => {
    if (courseData && !loading) {
      webViewRef.current?.postMessage(courseData as string);
    }
  }, [courseData, loading]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <AlertCircle size={48} color="#ef4444" className="mb-4" />
        <Text className="text-text text-xl font-bold mb-2">
          Oops! Something went wrong
        </Text>
        <Text className="text-muted text-center mb-6">
          We couldn't load the course content. Please check your connection and
          try again.
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl flex-row items-center"
          onPress={() => {
            setError(false);
            setLoading(true);
          }}
        >
          <RefreshCw size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold ml-2">Retry Loading</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <View className="flex-1 relative">
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: HTML_CONTENT }}
          onMessage={onMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setError(true)}
          style={{ flex: 1, backgroundColor: "transparent" }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-background/50">
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
