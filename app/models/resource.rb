class Resource < ActiveRecord::Base
  belongs_to :project
  validates :slug, :uri, presence: true  
  validates :slug, :uri, uniqueness: {scope: :project_id}
  attr_accessible :name, :uri

  before_validation :generate_slug

  # Generate a URL friendly slug for the resource before saving.
  def generate_slug
    slug = uri.to_s.gsub(/:id/, '').gsub(/[^a-zA-Z0-9]+/, '-').gsub(/^-|-$/, '')
    
    # If there is a duplicate slug then loop over existing slugs to 
    # find the next highest numbered slug.
    if project.resources.where(:slug => slug).count > 0
      index = 0
      project.resources.where("slug LIKE ?", "#{slug}%").each do |r|
        m, i = *r.slug.match(/#{Regexp.escape(slug)}-(\d+)$/)
        index = [index, i.to_i].max if m
      end
      slug += "-#{index+1}"
    end

    self.slug = slug
  end
end
