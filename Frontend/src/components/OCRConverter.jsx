import { useState } from "react";
import { FileText, Download, Camera, Wand2 } from "lucide-react";
import { geminiService } from "../services/geminiService";
import toast from "react-hot-toast";

function OCRConverter() {
  const [imageFile, setImageFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be less than 10MB");
        return;
      }

      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const extractTextFromImage = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const result = await geminiService.extractTextFromImage(imageFile);
      setExtractedText(result.text);
      toast.success("Text extracted successfully!");
    } catch (error) {
      console.error("Error extracting text:", error);
      toast.error("Failed to extract text from image");
    } finally {
      setLoading(false);
    }
  };

  const convertHandwrittenNotes = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    try {
      const text = await geminiService.convertHandwrittenNotesToText(imageFile);
      setExtractedText(text);
      toast.success("Handwritten notes converted successfully!");
    } catch (error) {
      console.error("Error converting handwritten notes:", error);
      toast.error("Failed to convert handwritten notes");
    } finally {
      setLoading(false);
    }
  };

  const downloadText = () => {
    if (!extractedText) {
      toast.error("No text to download");
      return;
    }

    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted_text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Text downloaded successfully!");
  };

  const copyToClipboard = () => {
    if (!extractedText) {
      toast.error("No text to copy");
      return;
    }

    navigator.clipboard.writeText(extractedText);
    toast.success("Text copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          OCR Text Converter
        </h1>
        <p className="text-gray-600">
          Convert handwritten notes and images to digital text using AI
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Image
          </h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-500 font-medium">
                  Choose an image
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Supports JPG, PNG, GIF (max 10MB)
              </p>
            </div>

            {previewUrl && (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-contain border rounded-lg"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={extractTextFromImage}
                    disabled={loading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {loading ? "Extracting..." : "Extract Text"}
                  </button>

                  <button
                    onClick={convertHandwrittenNotes}
                    disabled={loading}
                    className="btn-secondary flex-1 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {loading ? "Converting..." : "Convert Notes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Text Output */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Extracted Text
            </h2>
            {extractedText && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="btn-secondary text-sm"
                >
                  Copy
                </button>
                <button onClick={downloadText} className="btn-primary text-sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            )}
          </div>

          {extractedText ? (
            <div className="space-y-4">
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Extracted text will appear here..."
              />

              <div className="text-sm text-gray-600">
                <p>✓ Text extracted successfully</p>
                <p>✓ You can edit the text above if needed</p>
                <p>✓ Use Copy or Download buttons to save</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Upload an image and extract text to see results here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Text Extraction</h3>
            <p className="text-sm text-gray-600">
              Extract text from printed documents, screenshots, and images
            </p>
          </div>

          <div className="text-center">
            <Wand2 className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Handwritten Notes</h3>
            <p className="text-sm text-gray-600">
              Convert handwritten notes to digital text with high accuracy
            </p>
          </div>

          <div className="text-center">
            <Download className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Export Options</h3>
            <p className="text-sm text-gray-600">
              Copy to clipboard or download as text file
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OCRConverter;
