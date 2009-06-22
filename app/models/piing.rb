require 'png'
require 'png/reader'
require 'paperclip_file'

class Piing < ActiveRecord::Base
  has_attached_file :png
  has_attached_file :torrent

  before_save :convert_to_png

  def convert_to_png
    content = self.torrent.queued_for_write[:original].read
    decimal = content.unpack("C*")

    font_width = 5
    height = 30
    width = decimal.size / 3 / height + 1

    canvas = PNG::Canvas.new(width + font_width + 2, height + 2, PNG::Color::Black)
    pixels = decimal.in_groups_of(3)
    lines = pixels.in_groups_of(height)

    lines.each_with_index do |line, i|
      line.each_with_index do |pixel, j|
        pixel ||= []
        pixel[0] ||= 0
        pixel[1] ||= 0
        pixel[2] ||= 0
        canvas[i + font_width + 1, j + 1] = PNG::Color.new(pixel[0], pixel[1], pixel[2], 255)
      end
    end

    logo_path = File.join(File.dirname(__FILE__), '..', '..', 'public', 'images', 'hidim.png')
    logo = PNG.load_file logo_path
    
    canvas.composite logo, 1, 1
    
    png = PNG.new canvas
    pngfile = PaperClipFile.new
    pngfile.original_filename = "torrent.png"
    tmpfile = Tempfile.new('torrent')
    tmpfile.write(png.to_blob)
    pngfile.to_tempfile = tmpfile

    self.attachment_for(:png).assign(pngfile)
  end
end
