class CreateStateLinks < ActiveRecord::Migration
  def up
    create_table(:state_links) do |t|
      t.references :source, null: false
      t.references :target, null: false
      t.timestamps
    end

    remove_column :states, :parent_id
  end

  def down
    raise ActiveRecord::IrreversibleMigration.new()
  end
end
