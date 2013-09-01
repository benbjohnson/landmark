class ChangeStateExpressionToText < ActiveRecord::Migration
  def up
    change_column :states, :expression, :text
  end

  def down
    change_column :states, :expression, :string
  end
end
