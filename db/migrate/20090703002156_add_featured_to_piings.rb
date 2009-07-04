class AddFeaturedToPiings < ActiveRecord::Migration
  def self.up
    add_column :hidims, :featured, :boolean
  end

  def self.down
    remove_column :hidims, :featured
  end
end
