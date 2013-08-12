class CreateFlows < ActiveRecord::Migration
  def change
    create_table(:flows) do |t|
      t.references :project, null: false
      t.string :name, null: false, default: ''
      t.timestamps
    end
  end
end
