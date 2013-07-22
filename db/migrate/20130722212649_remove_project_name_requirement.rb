class RemoveProjectNameRequirement < ActiveRecord::Migration
  def change
    change_column :projects, :name, :string, :null => true
  end
end
