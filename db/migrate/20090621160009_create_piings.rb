class CreatePiings < ActiveRecord::Migration
  def self.up
    create_table :piings do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :piings
  end
end
