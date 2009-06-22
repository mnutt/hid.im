class PaperClipFile
  attr_accessor :to_tempfile

  attr_accessor_with_default :original_filename, ""
  attr_accessor_with_default :content_type, ""
  attr_accessor_with_default :size, 0
end
