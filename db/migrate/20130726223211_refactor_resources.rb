class RefactorResources < ActiveRecord::Migration
  def change
    remove_column :resources, :uri
    add_column :resources, :label, :string, :null => false, :default => ''
  end
end
