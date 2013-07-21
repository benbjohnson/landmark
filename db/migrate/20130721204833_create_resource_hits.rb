class CreateResourceHits < ActiveRecord::Migration
  def change
    create_table(:resource_hits) do |t|
      t.references :resource, null: false
      t.date :hit_date, null: false
      t.integer :count, null: false, default: 0
    end

    add_index :resource_hits, [:resource_id, :hit_date]
  end
end
