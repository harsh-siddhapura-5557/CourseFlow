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
import { Colors } from "@/constants/Colors";

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Course Content</title>
    <style>
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; background: #F8FAFC; color: #0F172A; margin: 0; line-height: 1.5; }
        .header { margin-bottom: 32px; }
        .title { font-size: 32px; font-weight: 900; margin: 0 0 8px 0; color: #0F172A; letter-spacing: -0.025em; }
        .instructor { color: #6366F1; font-weight: 700; font-size: 16px; margin: 0; }
        .card { background: white; padding: 24px; border-radius: 32px; border: 1px solid #F1F5F9; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .video-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #0F172A; border-radius: 24px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 24px; cursor: pointer; }
        .video-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; }
        .play-button { width: 64px; height: 64px; background: #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.3); transition: transform 0.2s; }
        .play-button:active { transform: scale(0.95); }
        .play-icon { width: 0; height: 0; border-style: solid; border-width: 12px 0 12px 20px; border-color: transparent transparent transparent #ffffff; margin-left: 4px; }
        .description { font-size: 18px; color: #64748B; font-weight: 500; margin: 0 0 32px 0; line-height: 1.6; }
        button { background: #6366F1; color: white; border: none; padding: 20px; border-radius: 24px; font-weight: 800; width: 100%; font-size: 18px; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.2); transition: all 0.2s; }
        button:active { transform: scale(0.98); opacity: 0.9; }
    </style>
</head>
<body>
    <div class="header">
        <h1 id="course-title" class="title">Loading...</h1>
        <p id="course-instructor" class="instructor"></p>
    </div>
    <div class="card">
        <div class="video-container" onclick="window.ReactNativeWebView.postMessage('VIDEO_PLAY')">
            <div class="video-overlay">
                <div class="play-button">
                    <div class="play-icon"></div>
                </div>
            </div>
        </div>
        <p id="course-description" class="description"></p>
        <button onclick="window.ReactNativeWebView.postMessage('LESSON_COMPLETE')">Complete Lesson</button>
    </div>
    <script>
        window.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            document.getElementById('course-title').innerText = data.title;
            document.getElementById('course-instructor').innerText = 'by ' + (data.instructor ? data.instructor.name.first + ' ' + data.instructor.name.last : 'Joseph Evans');
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

  const [isReady, setIsReady] = useState(false);

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
    if (courseData && isReady) {
      // Small delay to ensure WebView is fully ready to receive messages
      const timer = setTimeout(() => {
        webViewRef.current?.postMessage(courseData as string);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [courseData, isReady]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <View className="bg-red-50 p-6 rounded-[40px] mb-6">
          <AlertCircle size={56} color={Colors.error} strokeWidth={1.5} />
        </View>
        <Text className="text-slate-900 text-3xl font-black mb-3 text-center tracking-tight">
          Content Error
        </Text>
        <Text className="text-slate-500 text-lg font-medium text-center mb-10 leading-6 px-4">
          We couldn't load the course content. Please check your connection or
          try again.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-[#6366f1] px-10 py-5 rounded-[28px] flex-row items-center shadow-xl shadow-indigo-100"
          onPress={() => {
            setError(false);
            setLoading(true);
            webViewRef.current?.reload();
          }}
        >
          <RefreshCw size={20} color={Colors.white} strokeWidth={2.5} />
          <Text className="text-white font-black text-lg ml-3">
            Retry Content
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Custom Header with Back Button */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-slate-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={Colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View className="flex-1 items-center mr-10">
          <Text className="text-xl font-extrabold text-slate-900">
            Course Content
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <WebView
          ref={webViewRef}
          source={{ 
            html: HTML_CONTENT,
            headers: {
              ...(courseData && typeof courseData === 'string' && JSON.parse(courseData as string).id
                ? { 'X-Course-Id': JSON.parse(courseData as string).id.toString() }
                : {}),
              'X-App-Platform': 'React-Native-Expo'
            }
          }}
          onMessage={onMessage}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setLoading(false);
            setIsReady(true);
          }}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          className="flex-1"
        />
        {loading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Colors.white,
              zIndex: 10,
            }}
          >
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text
              style={{
                marginTop: 16,
                color: Colors.muted,
                fontWeight: "bold",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Preparing Content...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
