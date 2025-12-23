"use client";

import { Image as ImageIcon, Info } from "lucide-react";
import { useState } from "react";

export function ImageInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
        type="button"
      >
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            How to insert images in your post
          </span>
        </div>
        <span className="text-blue-600">{isOpen ? "−" : "+"}</span>
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3 text-sm text-blue-900">
          <div>
            <p className="font-semibold mb-2">Method 1: Insert image in content (recommended)</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Click the <ImageIcon className="inline h-4 w-4" /> image icon in the toolbar above</li>
              <li>Paste a direct image URL when prompted</li>
              <li>The image will appear in your content where your cursor is</li>
            </ol>
            <p className="mt-2 text-xs text-blue-700 italic">
              Tip: You can insert multiple images anywhere in your post content
            </p>
          </div>
          
          <div className="pt-3 border-t border-blue-200">
            <p className="font-semibold mb-2">Method 2: Featured image (optional)</p>
            <p className="mb-2">
              Add a featured image URL in the "Featured Image URL" field above. This image will appear at the top of your post, similar to Medium articles.
            </p>
          </div>
          
          <div className="pt-3 border-t border-blue-200">
            <p className="font-semibold mb-2">How to get an image URL:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Find an image on any website (Pexels, Unsplash, Imgur, etc.)</li>
              <li>Right-click on the image</li>
              <li>Select "Copy image address" or "Copy image URL"</li>
              <li>Paste it in the prompt or field</li>
            </ol>
            <p className="mt-2 text-xs text-blue-700 italic">
              Note: The URL must be a direct link to an image file (ending with .jpg, .png, .gif, etc.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}






