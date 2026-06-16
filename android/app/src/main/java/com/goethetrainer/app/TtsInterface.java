package com.goethetrainer.app;

import android.content.Context;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.util.Locale;

/**
 * Direct Android TTS bridge exposed to the WebView as window.AndroidTts.
 * More reliable than the Capacitor plugin when loading from a remote server URL,
 * because it bypasses the plugin bridge registration layer entirely.
 */
public class TtsInterface implements TextToSpeech.OnInitListener {

    private final WebView webView;
    private final TextToSpeech tts;
    private boolean ready = false;

    public TtsInterface(Context context, WebView webView) {
        this.webView = webView;
        this.tts = new TextToSpeech(context, this);
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            ready = true;
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String id) {}

                @Override
                public void onDone(String id) {
                    fireCallback("_ttsOnDone", id);
                }

                @Override
                public void onError(String id) {
                    fireCallback("_ttsOnError", id);
                }
            });
        }
    }

    private void fireCallback(String fn, String id) {
        // id is always "tts_N" — safe to inline
        String js = "if(window." + fn + ")window." + fn + "('" + id + "')";
        webView.post(() -> webView.evaluateJavascript(js, null));
    }

    @JavascriptInterface
    public void speak(String text, String lang, float rate, String callbackId) {
        if (!ready) {
            fireCallback("_ttsOnError", callbackId);
            return;
        }
        try {
            Locale locale = (lang == null || lang.isEmpty())
                ? Locale.getDefault()
                : Locale.forLanguageTag(lang);
            tts.setLanguage(locale);
        } catch (Exception ignored) {}

        tts.setSpeechRate(rate);

        Bundle params = new Bundle();
        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, callbackId);

        int result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, callbackId);
        if (result == TextToSpeech.ERROR) {
            fireCallback("_ttsOnError", callbackId);
        }
    }

    @JavascriptInterface
    public void stop() {
        if (ready) tts.stop();
    }

    @JavascriptInterface
    public boolean isReady() {
        return ready;
    }
}
