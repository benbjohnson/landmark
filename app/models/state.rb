class State < ActiveRecord::Base
  belongs_to :project
  has_many :source_links, class_name: "StateLink", foreign_key: "target_id"
  has_many :sources, :through => :source_links
  has_many :target_links, class_name: "StateLink", foreign_key: "source_id"
  has_many :targets, :through => :target_links

  validates :name, :expression, presence: true  
  validates :name, uniqueness: {scope: :project_id}

  attr_accessible(:name, :expression)
end
