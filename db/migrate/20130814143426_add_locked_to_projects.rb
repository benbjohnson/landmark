class AddLockedToProjects < ActiveRecord::Migration
  def change
    add_column :projects, :locked, :boolean, null: false, default: false
  end
end
