class CreateProjects < ActiveRecord::Migration
  def up
    create_table :projects do |t|
      t.references :account
      t.string :name, :null => false, :default => ""
      t.string :api_key, :null => false
      t.timestamps
    end
  end

  def down
    drop_table :projects
  end
end
