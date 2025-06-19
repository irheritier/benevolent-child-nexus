
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, X } from "lucide-react";

interface DocumentUploadProps {
  texts: any;
  uploadedFile: any;
  isUploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export const DocumentUpload = ({ 
  texts, 
  uploadedFile, 
  isUploading, 
  onFileUpload, 
  onRemoveFile 
}: DocumentUploadProps) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 text-base sm:text-lg">
              {texts.documents.required}
            </h4>
            <p className="text-amber-700 dark:text-amber-300 text-sm sm:text-base">
              {texts.documents.singleFileLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {!uploadedFile ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
              {isUploading ? texts.documents.uploading : texts.documents.uploadText}
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
              {texts.documents.acceptedFormats}
            </p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
              className="px-6 sm:px-8 py-2 sm:py-3 border-2 text-sm sm:text-base w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              {isUploading ? texts.documents.uploading : texts.buttons.upload}
            </Button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 text-green-700 dark:text-green-300 mb-3 sm:mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold text-base sm:text-lg">
                {texts.documents.fileSelected}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg border border-green-100 dark:border-green-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-lg block truncate">
                      {uploadedFile.file.name}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemoveFile}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
        <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-sm sm:text-base">
          <strong>Note légale :</strong> {texts.documents.legalNotice}
        </p>
      </div>
    </div>
  );
};
