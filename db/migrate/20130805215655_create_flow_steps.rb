class CreateFlowSteps < ActiveRecord::Migration
  def change
    create_table(:flow_steps) do |t|
      t.references :flow, null: false
      t.string :resource, null: false, default: ''
      t.integer :index, null: false
      t.timestamps
    end
    
    add_index :flow_steps, [:flow_id, :index]
  end
end
