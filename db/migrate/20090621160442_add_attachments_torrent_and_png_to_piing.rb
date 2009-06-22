class AddAttachmentsTorrentAndPngToPiing < ActiveRecord::Migration
  def self.up
    add_column :piings, :torrent_file_name, :string
    add_column :piings, :torrent_content_type, :string
    add_column :piings, :torrent_file_size, :integer
    add_column :piings, :torrent_updated_at, :datetime
    add_column :piings, :png_file_name, :string
    add_column :piings, :png_content_type, :string
    add_column :piings, :png_file_size, :integer
    add_column :piings, :png_updated_at, :datetime
  end

  def self.down
    remove_column :piings, :torrent_file_name
    remove_column :piings, :torrent_content_type
    remove_column :piings, :torrent_file_size
    remove_column :piings, :torrent_updated_at
    remove_column :piings, :png_file_name
    remove_column :piings, :png_content_type
    remove_column :piings, :png_file_size
    remove_column :piings, :png_updated_at
  end
end
