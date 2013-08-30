class CreateStates < ActiveRecord::Migration
  def change
    create_table(:states) do |t|
      t.references :project, null: false
      t.references :parent
      t.string :name, null: false
      t.string :expression
      t.timestamps
    end
  end
end
