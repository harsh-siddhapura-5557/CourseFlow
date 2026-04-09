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
        .header { margin-bottom: 24px; }
        .title { font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #0F172A; letter-spacing: -0.025em; }
        .instructor { color: #6366F1; font-weight: 700; font-size: 16px; margin: 0; }
        .card { background: white; padding: 24px; border-radius: 24px; border: 1px solid #F1F5F9; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .section-label { font-size: 12px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: block; }
        .description { font-size: 16px; color: #334155; font-weight: 500; margin: 0 0 24px 0; line-height: 1.6; }
        button { background: #6366F1; color: white; border: none; padding: 18px; border-radius: 16px; font-weight: 700; width: 100%; font-size: 16px; cursor: pointer; transition: opacity 0.2s; }
        button:active { opacity: 0.8; }
        .info-row { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #F1F5F9; }
        .info-item { text-align: center; flex: 1; }
        .info-value { display: block; font-size: 16px; font-weight: 800; color: #0F172A; }
        .info-label { display: block; font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="header">
        <h1 id="course-title" class="title">Loading...</h1>
        <p id="course-instructor" class="instructor"></p>
    </div>

    <div class="card">
        <span class="section-label">Course Description</span>
        <p id="course-description" class="description"></p>
        
        <div class="info-row">
            <div class="info-item">
                <span id="course-price" class="info-value">-</span>
                <span class="info-label">Price</span>
            </div>
            <div class="info-item">
                <span id="course-category" class="info-value">-</span>
                <span class="info-label">Category</span>
            </div>
        </div>

        <div style="margin-top: 32px;">
            <button onclick="window.ReactNativeWebView.postMessage('LESSON_COMPLETE')">Complete Lesson</button>
        </div>
    </div>

    <script>
        window.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                document.getElementById('course-title').innerText = data.title || 'Untitled Course';
                document.getElementById('course-instructor').innerText = 'by ' + (data.instructor ? data.instructor.name.first + ' ' + data.instructor.name.last : 'Joseph Evans');
                document.getElementById('course-description').innerText = data.description || 'No description available.';
                document.getElementById('course-price').innerText = '$' + (data.price || '0');
                document.getElementById('course-category').innerText = data.category || 'General';
            } catch (e) {
                console.error('Error parsing course data:', e);
            }
        });
    </script>
</body>
</html>
`;

export default function WebViewScreen() {
  const {
    courseData,
    url: paramUrl,
    title: paramTitle,
  } = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isReady, setIsReady] = useState(false);

  // Determine if we're showing a specific URL or the course content HTML
  const url = paramUrl as string;
  const title =
    (paramTitle as string) || (courseData ? "Course Content" : "Content");

  const onMessage = (event: any) => {
    const message = event.nativeEvent.data;
    if (message === "LESSON_COMPLETE") {
      Alert.alert("Congratulations!", "You have completed this lesson.", [
        { text: "Back to Course", onPress: () => router.back() },
      ]);
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
          We couldn't load the {title.toLowerCase()}. Please check your
          connection or try again.
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
          <Text className="text-white font-black text-lg ml-3">Retry</Text>
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
          <Text className="text-xl font-extrabold text-slate-900">{title}</Text>
        </View>
      </View>

      <View className="flex-1">
        <WebView
          ref={webViewRef}
          source={
            url
              ? { uri: url }
              : {
                  html: HTML_CONTENT,
                  headers: courseData
                    ? {
                        ...(typeof courseData === "string" &&
                        JSON.parse(courseData as string).id
                          ? {
                              "X-Course-Id": JSON.parse(
                                courseData as string,
                              ).id.toString(),
                            }
                          : {}),
                        "X-App-Platform": "React-Native-Expo",
                      }
                    : {},
                }
          }
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
