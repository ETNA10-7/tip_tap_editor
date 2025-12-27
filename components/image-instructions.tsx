"use client";

import { Image as ImageIcon, Info } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";

export function ImageInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <div className={`rounded-lg border p-4 ${
      isLightMode
        ? "border-teal-600/50 bg-teal-100/80"
        : "border-teal-500/50 bg-teal-500/20"
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
        type="button"
      >
        <div className="flex items-center gap-2">
          <ImageIcon className={`h-5 w-5 ${
            isLightMode ? "text-teal-700" : "text-teal-400"
          }`} />
          <span className={`font-semibold ${
            isLightMode ? "text-teal-900" : "text-teal-300"
          }`}>
            How to insert images in your post
          </span>
        </div>
        <span className={isLightMode ? "text-teal-700" : "text-teal-400"}>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      
      {isOpen && (
        <div className={`mt-4 space-y-3 text-sm ${
          isLightMode ? "text-teal-900" : "text-teal-200"
        }`}>
          <div>
            <p className="font-semibold mb-2">Method 1: Insert image in content (recommended)</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click the <ImageIcon className="inline h-4 w-4" /> image icon in the toolbar above</li>
              <li>Paste a direct image URL when prompted</li>
              <li>The image will appear in your content where your cursor is</li>
            </ol>
            <p className={`mt-2 text-xs italic ${
              isLightMode ? "text-teal-800" : "text-teal-300"
            }`}>
              Tip: You can insert multiple images anywhere in your post content
            </p>
          </div>
          
          <div className={`pt-3 border-t ${
            isLightMode ? "border-teal-600/50" : "border-teal-500/50"
          }`}>
            <p className="font-semibold mb-2">Method 2: Featured image (optional)</p>
            <p className="mb-2">
              Add a featured image URL in the "Featured Image URL" field above. This image will appear at the top of your post, similar to Medium articles.
            </p>
          </div>
          
          <div className={`pt-3 border-t ${
            isLightMode ? "border-teal-600/50" : "border-teal-500/50"
          }`}>
            <p className="font-semibold mb-2">How to get an image URL:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Find an image on any website (Pexels, Unsplash, Imgur, etc.)</li>
              <li>Right-click on the image</li>
              <li>Select "Copy image address" or "Copy image URL"</li>
              <li>Paste it in the prompt or field</li>
            </ol>
            <p className={`mt-2 text-xs italic ${
              isLightMode ? "text-teal-800" : "text-teal-300"
            }`}>
              Note: The URL must be a direct link to an image file (ending with .jpg, .png, .gif, etc.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}







