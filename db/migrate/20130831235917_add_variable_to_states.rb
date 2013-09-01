class AddVariableToStates < ActiveRecord::Migration
  def change
    add_column :states, :variable, :string
  end
end
