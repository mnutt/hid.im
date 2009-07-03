class AddFeaturedToPiings < ActiveRecord::Migration
  def self.up
    add_column :piings, :featured, :boolean
  end

  def self.down
    remove_column :piings, :featured
  end
end
