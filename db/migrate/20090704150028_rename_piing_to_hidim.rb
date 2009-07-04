class RenamePiingToHidim < ActiveRecord::Migration
  def self.up
    rename_table :piings, :hidims
  end

  def self.down
    rename_table :piings, :hidims
  end
end
