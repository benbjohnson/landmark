class CreateResources < ActiveRecord::Migration
  def change
    create_table(:resources) do |t|
      t.references :project
      t.string :channel
      t.string :name
      t.string :slug
      t.string :uri
    end

    add_index :resources, [:project_id, :slug]
  end
end
