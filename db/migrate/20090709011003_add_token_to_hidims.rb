class AddTokenToHidims < ActiveRecord::Migration
  def self.up
    add_column :hidims, :token, :string
    add_index :hidims, :token
  end

  def self.down
    remove_column :hidims, :token
  end
end
